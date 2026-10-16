const jar = pm.cookies.jar();

let baseUrl = pm.environment.get("baseUrl");
let frontendUrl = pm.environment.get("fontendUrl");

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
    } else if (pm.request.url.getPath() === "/login") {
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

            jar.get(frontendUrl, "XSRF-TOKEN", (err, cookie) => {
                if (err) {
                    console.error("Erro ao obter cookie CSRF:", err);
                    return;
                }

                pm.request.addHeader({
                    key: "X-XSRF-TOKEN",
                    value: cookie,
                });

                pm.request.addHeader({
                    key: "Referer",
                    value: frontendUrl,
                });
            });
        },
    );
}
