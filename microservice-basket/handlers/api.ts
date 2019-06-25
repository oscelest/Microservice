import Basket from "../../microservice-shared/typescript/entities/Basket";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";

new Endpoint<Endpoint.FindQuery, object, object>("/", Endpoint.Method.GET, (request, response) => Basket.find(request, response));
new Endpoint<object, object, Endpoint.UUIDLocals>("/:id", Endpoint.Method.GET, (request, response) => Basket.findById(request, response));
new Endpoint<object, Basket.FindLastRequestBody, object>("/last", Endpoint.Method.GET, (request, response) => Basket.findLast(request, response));
new Endpoint<object, Basket.CreateRequestBody, object>("/", Endpoint.Method.POST, (request, response) => Basket.create(request, response));
new Endpoint<object, Basket.UpdateRequestBody, Endpoint.UUIDLocals>("/:id", Endpoint.Method.PUT, (request, response) => Basket.update(request, response));
new Endpoint<object, Basket.SetProductRequestBody, Endpoint.UUIDLocals>("/:id/product", Endpoint.Method.POST, (request, response) => Basket.setProduct(request, response));
