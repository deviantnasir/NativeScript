import * as app from "tns-core-modules/application/application";
import * as frame from "tns-core-modules/ui/frame";
import * as helper from "../ui/helper";
import * as TKUnit from "../TKUnit";
import { Button } from "tns-core-modules/ui/button/button";
import { Color } from "tns-core-modules/color";
import { Page } from "tns-core-modules/ui/page";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";

const appCssFileName = "./app/application.css";
const appNewCssFileName = "./app/app-new.css";
const appNewScssFileName = "./app/app-new.scss";

const green = new Color("green");

function createTestFrameRootEntry() {
    const page = new Page();
    const frameRoot = new frame.Frame();
    frameRoot.navigate("app/mainPage");

    const entry: frame.NavigationEntry = {
        create: () => frameRoot
    };

    return {
        entry: entry,
        root: frameRoot,
        page: page
    };
}

const pageFactory = function (): Page {
    const page = new Page();
    const stack = new StackLayout();
    const button = new Button();
    button.id = "button";
    button.text = "button";
    stack.addChild(button);
    page.content = stack;
    return page;
}

export function test_onLiveSync_HmrContext_AppStyle_AppNewCss() {
    _test_onLiveSync_HmrContext_AppStyle(appNewCssFileName);
}

export function test_onLiveSync_HmrContext_AppStyle_AppNewScss() {
    _test_onLiveSync_HmrContext_AppStyle(appNewScssFileName);
}

export function setUpModule() {
    const resetFrameRoot = createTestFrameRootEntry();
    app._resetRootView(resetFrameRoot.entry);
    TKUnit.waitUntilReady(() => resetFrameRoot.page.isLoaded);
}

export function tearDown() {
    app.setCssFileName(appCssFileName);
}

function _test_onLiveSync_HmrContext_AppStyle(styleFileName: string) {
    const pageBeforeNavigation = helper.getCurrentPage();
    helper.navigateWithHistory(pageFactory);
    app.setCssFileName(styleFileName);

    const pageBeforeLiveSync = helper.getCurrentPage();
    global.__onLiveSync({ type: "style", module: styleFileName });

    const pageAfterLiveSync = helper.getCurrentPage();
    TKUnit.waitUntilReady(() => pageAfterLiveSync.getViewById("button").style.color === green, 3, false);

    TKUnit.assertTrue(pageAfterLiveSync.frame.canGoBack(), "App styles NOT applied - livesync navigation executed!");
    TKUnit.assertEqual(pageAfterLiveSync, pageBeforeLiveSync, "Pages are different - livesync navigation executed!");
    TKUnit.assertTrue(pageAfterLiveSync._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version NOT applied!");

    helper.goBack();

    const pageAfterNavigationBack = helper.getCurrentPage();
    TKUnit.assertEqual(pageAfterNavigationBack.getViewById("label").style.color, green, "App styles NOT applied on back navigation!");
    TKUnit.assertEqual(pageBeforeNavigation, pageAfterNavigationBack, "Pages are different - livesync navigation executed!");
    TKUnit.assertTrue(pageAfterNavigationBack._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version is NOT applied!");
}

