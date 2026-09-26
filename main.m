#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface AppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate, NSDraggingDestination>
@property (strong, nonatomic) NSWindow *window;
@property (strong, nonatomic) WKWebView *webView;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    NSScreen *screen = [NSScreen mainScreen];
    NSRect screenRect = screen ? [screen visibleFrame] : NSMakeRect(0, 0, 1280, 800);
    CGFloat width = MIN(1360, screenRect.size.width * 0.94);
    CGFloat height = MIN(920, screenRect.size.height * 0.94);
    NSRect windowRect = NSMakeRect((screenRect.size.width - width)/2 + screenRect.origin.x,
                                   (screenRect.size.height - height)/2 + screenRect.origin.y,
                                   width, height);

    self.window = [[NSWindow alloc] initWithContentRect:windowRect
                                              styleMask:(NSWindowStyleMaskTitled |
                                                         NSWindowStyleMaskClosable |
                                                         NSWindowStyleMaskMiniaturizable |
                                                         NSWindowStyleMaskResizable)
                                                backing:NSBackingStoreBuffered
                                                  defer:NO];

    [self.window setTitle:@"WortSchatz — German PDF Reader & Translator"];
    [self.window setMinSize:NSMakeSize(900, 650)];
    [self.window center];
    [self.window registerForDraggedTypes:@[NSPasteboardTypeFileURL]];

    // Configure WebKit with universal local access
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    WKPreferences *prefs = [[WKPreferences alloc] init];
    prefs.javaScriptCanOpenWindowsAutomatically = YES;
    [prefs setValue:@YES forKey:@"developerExtrasEnabled"];
    config.preferences = prefs;

    [config.preferences setValue:@YES forKey:@"allowFileAccessFromFileURLs"];
    [config setValue:@YES forKey:@"allowUniversalAccessFromFileURLs"];

    self.webView = [[WKWebView alloc] initWithFrame:[self.window.contentView bounds] configuration:config];
    [self.webView setAutoresizingMask:(NSViewWidthSizable | NSViewHeightSizable)];
    [self.webView setNavigationDelegate:self];
    [self.webView setUIDelegate:self];

    [self.window.contentView addSubview:self.webView];

    // Load bundled HTML resource
    NSString *htmlPath = [[NSBundle mainBundle] pathForResource:@"index" ofType:@"html"];
    if (htmlPath) {
        NSURL *fileURL = [NSURL fileURLWithPath:htmlPath];
        NSURL *resourceDir = [fileURL URLByDeletingLastPathComponent];
        [self.webView loadFileURL:fileURL allowingReadAccessToURL:resourceDir];
    } else {
        NSLog(@"Error: index.html not found in bundle resources!");
    }

    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

// WKUIDelegate: Native File Picker for <input type="file">
- (void)webView:(WKWebView *)webView runOpenPanelWithParameters:(WKOpenPanelParameters *)parameters initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(NSArray<NSURL *> * _Nullable))completionHandler {
    NSOpenPanel *openPanel = [NSOpenPanel openPanel];
    [openPanel setCanChooseFiles:YES];
    [openPanel setCanChooseDirectories:NO];
    [openPanel setAllowsMultipleSelection:parameters.allowsMultipleSelection];
    [openPanel setAllowedFileTypes:@[@"pdf", @"PDF"]];
    [openPanel setTitle:@"Select a German PDF Document"];

    [openPanel beginSheetModalForWindow:self.window completionHandler:^(NSModalResponse result) {
        if (result == NSModalResponseOK) {
            completionHandler(openPanel.URLs);
        } else {
            completionHandler(nil);
        }
    }];
}

// WKUIDelegate: Native JavaScript Alert Dialog
- (void)webView:(WKWebView *)webView runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(void))completionHandler {
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setMessageText:@"WortSchatz"];
    [alert setInformativeText:message];
    [alert addButtonWithTitle:@"OK"];
    [alert beginSheetModalForWindow:self.window completionHandler:^(NSModalResponse returnCode) {
        completionHandler();
    }];
}

// WKUIDelegate: Native JavaScript Confirm Dialog
- (void)webView:(WKWebView *)webView runJavaScriptConfirmPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(BOOL))completionHandler {
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setMessageText:@"WortSchatz Confirmation"];
    [alert setInformativeText:message];
    [alert addButtonWithTitle:@"Confirm"];
    [alert addButtonWithTitle:@"Cancel"];
    [alert beginSheetModalForWindow:self.window completionHandler:^(NSModalResponse returnCode) {
        completionHandler(returnCode == NSAlertFirstButtonReturn);
    }];
}

// Drag & Drop PDF files into Window
- (NSDragOperation)draggingEntered:(id<NSDraggingInfo>)sender {
    NSPasteboard *pboard = [sender draggingPasteboard];
    if ([[pboard types] containsObject:NSPasteboardTypeFileURL]) {
        return NSDragOperationCopy;
    }
    return NSDragOperationNone;
}

- (BOOL)performDragOperation:(id<NSDraggingInfo>)sender {
    NSPasteboard *pboard = [sender draggingPasteboard];
    if ([[pboard types] containsObject:NSPasteboardTypeFileURL]) {
        NSArray *urls = [pboard readObjectsForClasses:@[[NSURL class]] options:nil];
        if (urls.count > 0) {
            NSURL *fileUrl = urls[0];
            if ([[fileUrl pathExtension].lowercaseString isEqualToString:@"pdf"]) {
                NSData *pdfData = [NSData dataWithContentsOfURL:fileUrl];
                if (pdfData) {
                    NSString *base64 = [pdfData base64EncodedStringWithOptions:0];
                    NSString *fileName = [fileUrl lastPathComponent];
                    NSString *js = [NSString stringWithFormat:@"window.pdfViewer.loadDocument('%@'); document.getElementById('doc-title').textContent = '%@';", base64, fileName];
                    [self.webView evaluateJavaScript:js completionHandler:nil];
                    return YES;
                }
            }
        }
    }
    return NO;
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        AppDelegate *delegate = [[AppDelegate alloc] init];
        [app setDelegate:delegate];
        [app run];
    }
    return 0;
}
