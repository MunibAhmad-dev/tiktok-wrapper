#import <Foundation/Foundation.h>
#include <node_api.h>

// Bridge Electron's main process to Apple's native StoreKit rating overlay.
static napi_value RequestReview(napi_env env, napi_callback_info info) {
  bool invoked = false;
  Class controller = NSClassFromString(@"SKStoreReviewController");

  if (controller != nil) {
    SEL selector = NSSelectorFromString(@"requestReview");
    if ([controller respondsToSelector:selector]) {
      dispatch_block_t present = ^{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
        [controller performSelector:selector];
#pragma clang diagnostic pop
      };

      if ([NSThread isMainThread]) present();
      else dispatch_async(dispatch_get_main_queue(), present);
      invoked = true;
    }
  }

  napi_value result;
  napi_get_boolean(env, invoked, &result);
  return result;
}

static napi_value Init(napi_env env, napi_value exports) {
  napi_value fn;
  napi_create_function(env, "requestReview", NAPI_AUTO_LENGTH, RequestReview, nullptr, &fn);
  napi_set_named_property(env, exports, "requestReview", fn);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
