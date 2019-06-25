import rp from "request-promise";
import Basket from "../../microservice-shared/typescript/entities/Basket";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";
import Entity from "../../microservice-shared/typescript/services/Entity";
import Response from "../../microservice-shared/typescript/services/Response";

new Endpoint<Endpoint.FindQuery, object, object>("/basket", Endpoint.Method.GET, [
  Endpoint.setPermissionLevel(1),
  Endpoint.queryFields({
    start: {type: "number", min_value: 0, optional: true},
    limit: {type: "number", min_value: 1, max_value: 100, optional: true},
    sort:  {type: "string", optional: true},
    order: {type: "string", optional: true},
  }),
  (request, response) => rp({
    method: "GET",
    url:    `http://basket:${process.env.PORT}`,
    json:   true,
  })
  .then(res => response.json(res))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, object, Endpoint.UUIDLocals>("/basket/:id", Endpoint.Method.GET, [
  (request, response) => rp({
    method: "GET",
    url:    `http://basket:${process.env.PORT}/${response.locals.params.uuid}`,
    json:   true,
  })
  .then(res => {
    if (res.user && res.user.id !== Entity.uuidFromBuffer(response.locals.user.id)) return new Response(Response.Code.Forbidden, {auth: request.get("Authorization")}).Complete(response);
    return new Response(Response.Code.OK, res.content).Complete(response);
  })
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, object, Endpoint.UUIDLocals>("/basket/last", Endpoint.Method.GET, [
  (request, response) => rp({
    method: "GET",
    url:    `http://basket:${process.env.PORT}/last`,
    json:   true,
    body:   {
      user: response.locals.user ? Entity.uuidFromBuffer(response.locals.user.id) : null,
    },
  })
  .then(res => {
    if (res.user && res.user.id !== Entity.uuidFromBuffer(response.locals.user.id)) return new Response(Response.Code.Forbidden, {auth: request.get("Authorization")}).Complete(response);
    return new Response(Response.Code.OK, res.content).Complete(response);
  })
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Basket.CreateRequestBody, object>("/basket", Endpoint.Method.POST, [
  (request, response) => rp({
    method: "POST",
    url:    `http://basket:${process.env.PORT}`,
    json:   true,
    body:   {
      user: response.locals.user ? Entity.uuidFromBuffer(response.locals.user.id) : null,
    },
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Basket.UpdateRequestBody, Endpoint.UUIDLocals>("/basket/:id", Endpoint.Method.PUT, [
  Endpoint.bodyFields({
    user:           {type: "uuid", optional: true},
    flag_abandoned: {type: "boolean", optional: true},
    flag_completed: {type: "boolean", optional: true},
  }),
  (request, response, next) => rp({
    method: "GET",
    url:    `http://basket:${process.env.PORT}/${response.locals.params.uuid}`,
    json:   true,
  })
  .then(res => res.user && res.user.id !== Entity.uuidFromBuffer(response.locals.user.id) ? new Response(Response.Code.Forbidden, {auth: request.get("Authorization")}).Complete(response) : next())
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
  (request, response) => rp({
    method: "PUT",
    url:    `http://basket:${process.env.PORT}/${response.locals.params.uuid}`,
    json:   true,
    body:   request.body,
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);

new Endpoint<object, Basket.SetProductRequestBody, Endpoint.UUIDLocals>("/basket/:id/product", Endpoint.Method.POST, [
  Endpoint.bodyFields({
    quantity: {type: "number", min_value: 1, optional: true},
    product:  {type: "uuid"},
  }),
  (request, response) => rp({
    method: "POST",
    url:    `http://basket:${process.env.PORT}/${response.locals.params.uuid}/product`,
    json:   true,
    body:   {
      product:  request.body.product,
      quantity: request.body.quantity,
    },
  })
  .then(res => new Response(Response.Code.OK, res.content).Complete(response))
  .catch(err => response.status(err.response.statusCode).json(err.response.body)),
]);
