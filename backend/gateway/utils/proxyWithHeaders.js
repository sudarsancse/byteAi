import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqopts, req) => {
      if (req.user) {
        proxyReqopts.headers["x-user-id"] = req.user.userID;
      }
      return proxyReqopts;
    },
  });
};
