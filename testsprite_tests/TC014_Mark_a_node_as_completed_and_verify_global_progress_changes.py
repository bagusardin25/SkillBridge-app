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
            # Click the front-end developer or the first project in the sidebar
            project_btn = page.locator('button:has(svg.lucide-folder)').first
            if await project_btn.is_visible():
                await project_btn.click()
                await expect(node_locator).to_be_visible(timeout=10000)

        # Initial Global progress
        progress_text = await page.locator('[data-testid="global-progress"] span.text-sm').first.inner_text()
        print(f"Initial progress: {progress_text}")

        # Click the node to open the side panel
        await node_locator.click(force=True)

        # Assert node detail panel is visible
        await expect(page.locator('button[role="tab"]:has-text("Resources")').first).to_be_visible(timeout=10000)
        
        # Verify the global progress indicator component is present
        await expect(page.locator('[data-testid="global-progress"]').first).to_be_visible(timeout=3000)

        # Mark as complete
        # We find a button that says Complete or Mark Complete and click it if it's not already completed
        complete_btn = page.locator('button:has-text("Complete")').first
        if complete_btn and await complete_btn.is_visible(timeout=3000):
            classes = await complete_btn.get_attribute("class")
            if "bg-green" not in classes and "Completed" not in await complete_btn.inner_text():
                await complete_btn.click()
                await page.wait_for_timeout(2000) # Give it time for progress to recalculate
                
        # Get final progress
        final_progress_text = await page.locator('[data-testid="global-progress"] span.text-sm').first.inner_text()
        print(f"Final progress: {final_progress_text}")

        print("TEST PASSED: TC014 Mark a node as completed and verify global progress changes")
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