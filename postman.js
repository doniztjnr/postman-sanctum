const jar = pm.cookies.jar();

let baseUrl = pm.environment.get("baseUrl");
let frontendUrl = pm.environment.get("fontendUrl");

let email = pm.environment.get("api_email");
let password = pm.environment.get("api_password");

jar.get(frontendUrl, "XSRF-TOKEN", (err, cookie) => {
  if (!err && cookie) {
    pm.request.addHeader({
      key: "X-XSRF-TOKEN",
      value: cookie,
    });

    pm.request.addHeader({
      key: "Referer",
      value: frontendUrl,
    });
  } else {
    getSanctumCsrfCookie();
  }
});

function getSanctumCsrfCookie() {
  pm.sendRequest(
    {
      url: `${baseUrl}/sanctum/csrf-cookie`,
      method: "GET",
      header: {
        Accept: "application/json",
      },
    },
    (err, _res) => {
      if (err) {
        console.error("Erro ao obter cookie CSRF:", err);
        return;
      }

      obterTokenELogar();
    },
  );
}

function obterTokenELogar() {
  // O cookie deve ser consultado no domínio que o recebeu.
  jar.get(baseUrl, "XSRF-TOKEN", (err, cookie) => {
    if (err || !cookie) {
      console.error("Cookie XSRF-TOKEN não encontrado.");
      return;
    }

    makeLogin(cookie);
  });
}

function makeLogin(csrfToken) {
  let loginRequest = {
    url: `${baseUrl}/login`,
    method: "POST",
    header: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": csrfToken,
      Referer: frontendUrl,
    },
    body: {
      mode: "raw",
      raw: JSON.stringify({
        email: email,
        password: password,
      }),
    },
  };

  pm.sendRequest(loginRequest, function (err, res) {
    if (err) {
      console.error("Login request failed: ", err);
    }
  });
}
