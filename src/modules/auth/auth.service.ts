import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: "CLIENT" | "ORGANIZER" | "GATE";
}

interface LoginData {
    email: string;
    password: string;
}

export async function register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (existingUser) {
        throw new Error("E-mail já cadastrado");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
        },
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

export async function login(data: LoginData) {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user) {
        throw new Error("E-mail ou senha inválidos");
    }

    const passwordMatches = await bcrypt.compare(
        data.password,
        user.passwordHash,
    );

    if (!passwordMatches) {
        throw new Error("E-mail ou senha inválidos");
    }

    const options: SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    const token = jwt.sign(
        {
            sub: user.id,
            role: user.role,
        },
        env.JWT_SECRET,
        options,
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}