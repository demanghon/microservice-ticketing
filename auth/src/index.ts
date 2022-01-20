import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import dotenv from 'dotenv';
import { connect } from "./mongo/mongo-config";
import cookieSession from "cookie-session";
dotenv.config();

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: true,
}))

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.get('*', async (req, res, next) => {
    throw new NotFoundError();
})

app.use(errorHandler);

const start = async () => {
    connect().then(() => {
        app.listen(3000, () => {
            console.log("Listening on port 3000!");
        });
    });
};

start();