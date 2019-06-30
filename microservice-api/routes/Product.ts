import rp from "request-promise";
import Product from "../../microservice-shared/typescript/entities/Product";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";
import Response from "../../microservice-shared/typescript/services/Response";

new Endpoint<Endpoint.FindQuery, object, object>("/product", Endpoint.Method.GET, [
  Endpoint.queryFields({
    start: {type: "number", min_value: 0, optional: true},
    limit: {type: "number", min_value: 1, max_value: 1000, optional: true},
    sort:  {type: "string", optional: true},
    order: {type: "string", optional: true},
  }),
  (request, response) => rp({
    method: "GET",
    url:    `http://product:${process.env.PORT}?${Object.entries(request.query).map(v => `${v[0]}=${v[1]}`).join("&")}`,
    json:   true,
    body:   request.body,
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Product.CreateRequestBody, object>("/product", Endpoint.Method.POST, [
  Endpoint.setPermissionLevel(1),
  Endpoint.bodyFields({
    key:         {type: "string", min_length: 4, max_length: 128},
    title:       {type: "string", min_length: 4, max_length: 255},
    description: {type: "string"},
    image:       {type: "string"},
    stock:       {type: "number"},
    price:       {type: "number"},
  }),
  (request, response) => rp({
    method: "POST",
    url:    `http://product:${process.env.PORT}`,
    json:   true,
    body:   request.body,
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Product.UpdateRequestBody, Endpoint.UUIDLocals>("/product/:uuid", Endpoint.Method.PUT, [
  Endpoint.setPermissionLevel(1),
  Endpoint.bodyFields({
    key:         {type: "string", min_length: 4, max_length: 128, optional: true},
    title:       {type: "string", min_length: 4, max_length: 255, optional: true},
    description: {type: "string", optional: true},
    image:       {type: "string", optional: true},
    stock:       {type: "number", optional: true},
    price:       {type: "number", optional: true},
  }),
  (request, response) => rp({
    method: "PUT",
    url:    `http://product:${process.env.PORT}/${response.locals.params.uuid}`,
    json:   true,
    body:   request.body,
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Product.UpdateRequestBody, Endpoint.UUIDLocals>("/product/:uuid", Endpoint.Method.DELETE, [
  Endpoint.setPermissionLevel(1),
  (request, response) => rp({
    method: "DELETE",
    url:    `http://product:${process.env.PORT}/${response.locals.params.uuid}`,
    json:   true,
    body:   request.body,
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);
