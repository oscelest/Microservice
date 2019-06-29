import Checkout from "../../microservice-shared/typescript/entities/Checkout";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";

new Endpoint<Endpoint.FindQuery, object, object>("/", Endpoint.Method.GET, (request, response) => Checkout.find(request, response));
new Endpoint<object, Checkout.CreateRequestBody, object>("/", Endpoint.Method.POST, (request, response) => Checkout.create(request, response));
