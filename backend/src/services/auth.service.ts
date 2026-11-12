import prisma from "../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errores";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_REGEX = /^[a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ\s\-]{1,30}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,128}$/;
const SECUENCIAS_NUMERICAS = /(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/;

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"'%;()&+]/g, "");
}

function normalizarNombre(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function generarNombreUnico(base: string): Promise<string> {
  const nombreBase = normalizarNombre(base) || "autor";
  let candidato = nombreBase;
  let contador = 1;

  while (await prisma.usuario.findUnique({ where: { nombre: candidato } })) {
    contador += 1;
    candidato = `${nombreBase}-${contador}`;
  }

  return candidato;
}

function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

function validarNombre(nombre: string): boolean {
  return NOMBRE_REGEX.test(nombre);
}

function validarPassword(password: string): { valido: boolean; mensaje?: string } {
  if (!PASSWORD_REGEX.test(password)) {
    return { valido: false, mensaje: "La contraseña no cumple con los requisitos de seguridad" };
  }
  if (SECUENCIAS_NUMERICAS.test(password)) {
    return { valido: false, mensaje: "La contraseña contiene secuencias numéricas muy simples" };
  }
  return { valido: true };
}

export class AuthService {
  async registrar(nombre: string, email: string, password: string, rol: string = "lector") {
    const nombreLimpio = sanitizeInput(nombre);
    const emailLimpio = email.toLowerCase().trim();

    if (!validarNombre(nombreLimpio)) {
      throw new AppError("El nombre de usuario debe tener entre 1 y 30 caracteres (letras, números, _ - y espacios)", 400);
    }

    if (!validarEmail(emailLimpio)) {
      throw new AppError("El correo electrónico no es válido", 400);
    }

    const passwordValidation = validarPassword(password);
    if (!passwordValidation.valido) {
      throw new AppError(passwordValidation.mensaje || "La contraseña no cumple con los requisitos", 400);
    }

    const existeEmail = await prisma.usuario.findUnique({ where: { email: emailLimpio } });
    if (existeEmail) throw new AppError("El email ya está registrado", 400);

    const nombreFinal = await generarNombreUnico(nombreLimpio);

    const hash = await bcrypt.hash(password, 12);
    const usuario = await prisma.usuario.create({
      data: { nombre: nombreFinal, email: emailLimpio, password: hash, rol },
    });
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  }

  async login(email: string, password: string) {
    const emailLimpio = email.toLowerCase().trim();

    if (!validarEmail(emailLimpio)) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    if (!password || password.length > 128) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    const usuario = await prisma.usuario.findUnique({ where: { email: emailLimpio } });
    if (!usuario) throw new AppError("Credenciales incorrectas", 401);

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) throw new AppError("Credenciales incorrectas", 401);

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}