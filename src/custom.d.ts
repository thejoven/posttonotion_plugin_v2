declare global {
    namespace chrome {
      namespace webRequest {
        function filterResponseData(requestId: number): any;
      }
    }
  }