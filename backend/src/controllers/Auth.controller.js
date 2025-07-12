const AuthService = require("../services/Auth.service");
const CatchAsync = require("../utils/CatchAsync");
const httpStatus = require("http-status");

class AuthController {
    static RegisterUser = CatchAsync(async (req, res) => {
        const res_obj = await AuthService.RegisterUser(req.body);
        res.status(httpStatus.CREATED).send(res_obj);
    });

    static LoginUser = CatchAsync(async (req, res) => {
        const res_obj = await AuthService.LoginUser(req.body);
        res.status(httpStatus.OK).send(res_obj);
    });

    static ProfileController = CatchAsync(async (req, res) => {
        const res_obj = await AuthService.ProfileService(req.user);
        res.status(httpStatus.OK).send(res_obj);
    });

    static UpdateUser = CatchAsync(async (req, res) => {
        const res_obj = await AuthService.UpdateUser(req.params.id, req.body);
        res.status(httpStatus.OK).send(res_obj);
    });

    static FetchAllUsers = CatchAsync(async (req, res) => {
        const res_obj = await AuthService.GetAllUsers();
        res.status(httpStatus.OK).send(res_obj);
    });

    
    static DeleteUser = CatchAsync(async (req, res) => {
        const res_obj = await AuthService.DeleteUser(req.params.id);
        res.status(httpStatus.OK).send(res_obj);
    });
}

module.exports = AuthController;
