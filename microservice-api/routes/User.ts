import User from "../../microservice-shared/typescript/entities/User";
import Endpoint from "../../microservice-shared/typescript/services/Endpoint";

new Endpoint<object, User.CreateRequestBody, object>("/user", Endpoint.Method.POST, [
  Endpoint.bodyFields({
    username: {type: "string", min_length: 4, max_length: 32},
    email:    {type: "email"},
    password: {type: "password"},
  }),
  (request, response) => User.create(request, response),
]);

new Endpoint<object, User.LoginRequestBody, object>("/user/login", Endpoint.Method.POST, [
  Endpoint.bodyFields({
    username: {type: "string", min_length: 4, max_length: 32, optional: true},
    email:    {type: "email", optional: true},
    password: {type: "password", optional: true},
  }),
  async (request, response) => User.login(request, response),
]);
