import Product from "../../microservice-shared/typescript/entities/Product";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";

new Endpoint<Endpoint.FindQuery, object, object>("/", Endpoint.Method.GET, (request, response) => Product.find(request, response));
new Endpoint<object, object, Endpoint.UUIDLocals>("/:uuid", Endpoint.Method.GET, (request, response) => Product.findById(request, response));
new Endpoint<object, Product.CreateRequestBody, object>("/", Endpoint.Method.POST, (request, response) => Product.create(request, response));
new Endpoint<object, Product.UpdateRequestBody, Endpoint.UUIDLocals>("/:uuid", Endpoint.Method.PUT, (request, response) => Product.update(request, response));
new Endpoint<object, object, Endpoint.UUIDLocals>("/:uuid", Endpoint.Method.DELETE, (request, response) => Product.remove(request, response));
