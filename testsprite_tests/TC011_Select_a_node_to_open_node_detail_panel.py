import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

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

        # Assert node detail panel is visible (identified by presence of tabs like Resources, Note, AI Tutor)
        await expect(page.locator('button[role="tab"]:has-text("Resources")').first).to_be_visible(timeout=10000)
        await expect(page.locator('button[role="tab"]:has-text("AI Tutor")').first).to_be_visible(timeout=3000)

        print("TEST PASSED: TC011 Select a node to open node detail panel")
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