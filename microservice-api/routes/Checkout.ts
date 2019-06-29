import rp from "request-promise";
import Basket from "../../microservice-shared/typescript/entities/Basket";
import Checkout from "../../microservice-shared/typescript/entities/Checkout";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";
import Response from "../../microservice-shared/typescript/services/Response";

new Endpoint<Endpoint.FindQuery, object, object>("/checkout", Endpoint.Method.GET, [
  Endpoint.setPermissionLevel(0),
  Endpoint.queryFields({
    start: {type: "number", min_value: 0, optional: true},
    limit: {type: "number", min_value: 1, max_value: 100, optional: true},
    sort:  {type: "string", optional: true},
    order: {type: "string", optional: true},
  }),
  (request, response) => rp({
    method: "GET",
    url:    `http://checkout:${process.env.PORT}`,
    json:   true,
    body: {
      user: response.locals.user.id
    }
  })
  .then(res => response.json(res))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Checkout.CreateRequestBody, object>("/checkout", Endpoint.Method.POST, [
  (request, response) => rp({
    method: "POST",
    url:    `http://checkout:${process.env.PORT}`,
    json:   true,
    body:   {
      basket: request.body.basket,
      user: response.locals.user ? response.locals.user.id : null,
    },
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);
