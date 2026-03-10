import asyncio
import re
from playwright import async_api
from playwright.async_api import expect
import json

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(10000)

        # Mock API responses to guarantee the quiz passes
        async def mock_cached(route):
            await route.fulfill(status=200, content_type="application/json", body='{"cached":false}')
        
        async def mock_generate(route):
            mock_data = {
                "questions": [
                    {
                        "question": "Mock Question 1",
                        "options": ["Correct Option", "Wrong B", "Wrong C", "Wrong D"],
                        "correctIndex": 0,
                        "explanation": "Because it's A"
                    },
                    {
                        "question": "Mock Question 2",
                        "options": ["Correct Option", "Wrong B", "Wrong C", "Wrong D"],
                        "correctIndex": 0,
                        "explanation": "Because it's A"
                    }
                ]
            }
            await route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_data))
        
        async def mock_submit(route):
            mock_data = {
                "id": "mock_id",
                "score": 2,
                "totalQuestions": 2,
                "percentage": 100,
                "passed": True,
                "message": "Success"
            }
            await route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_data))

        async def mock_xp(route):
            await route.fulfill(status=200, content_type="application/json", body='{"id":"mock","xp":100,"level":1}')

        await context.route("**/api/quiz/cached/**", mock_cached)
        await context.route("**/api/quiz/generate*", mock_generate)
        await context.route("**/api/quiz/submit", mock_submit)
        await context.route("**/profile/*/add-xp", mock_xp)

        page = await context.new_page()

        # Login flow
        await page.goto("http://localhost:5173/login", wait_until="commit", timeout=10000)
        
        await page.locator('input[type="email"]').fill('ellisa@gmail.com')
        await page.locator('input[type="password"]').fill('ellisa123')
        await page.locator('button:has-text("Sign In")').click()

        # Wait for app to load
        await expect(page).to_have_url(re.compile(r".*/app.*"), timeout=15000)
        
        # Wait a bit for the graph to render
        await page.wait_for_timeout(3000)

        # Ensure any modals blocking the view are closed (like onboarding)
        close_btn = page.locator('button:has(svg.lucide-x)').first
        if await close_btn.is_visible(timeout=3000):
            await close_btn.click()

        # Wait for project to load, click on the first project in the sidebar if canvas is empty
        # Wait for either a node or the project button in sidebar
        node_locator = page.locator('div.react-flow__node').first
        
        # Check if we have nodes, if not, click a project
        try:
            await expect(node_locator).to_be_visible(timeout=3000)
        except Exception:
            # Click the first project in the sidebar
            project_btn = page.locator('button:has(svg.lucide-folder)').first
            if await project_btn.is_visible():
                await project_btn.click()
                await expect(node_locator).to_be_visible(timeout=10000)

        # Click the node to open the side panel
        # Double click or click or force click
        await node_locator.click(force=True)

        # Wait for the "Take Quiz" button or similar inside the panel
        quiz_btn = page.locator('button:has-text("Ikuti Kuis"), button:has-text("Take Quiz"), button:has-text("Mulai Kuis")').first
        await expect(quiz_btn).to_be_visible(timeout=10000)
        await quiz_btn.click()

        # Wait for Quiz Modal Question 1
        await expect(page.locator('text=Mock Question 1').first).to_be_visible(timeout=10000)
        
        # Answer Question 1 (Option A)
        await page.locator('button:has-text("A")').click()
        await page.locator('button:has-text("Selanjutnya")').click()

        # Wait for Question 2
        await expect(page.locator('text=Mock Question 2').first).to_be_visible(timeout=5000)
        
        # Answer Question 2 (Option A)
        await page.locator('button:has-text("A")').click()
        
        # Submit Quiz
        await page.locator('button:has-text("Kirim Jawaban")').click()

        # Assert XP modal shows +100 XP
        await expect(page.locator('text=+100 XP earned!').first).to_be_visible(timeout=10000)

        print("TEST PASSED: TC024 Complete quiz with passing score and see +100 XP message")
    except Exception as e:
        print(f"TEST FAILURE: {str(e)}")
        raise e
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())