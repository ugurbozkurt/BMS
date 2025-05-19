import { NextResponse } from "next/server";
import { UserModel } from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'ANAHTAR';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Gerekli alanların kontrolü
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre zorunludur" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Hassas bilgileri çıkart
    const { password: _, ...userWithoutPassword } = user;

    // Cookie ayarları
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      maxAge: 24 * 60 * 60, // 24 saat
      path: "/"
    };

    // Response oluştur
    const response = NextResponse.json(
      { 
        message: "Giriş başarılı",
        user: userWithoutPassword
      },
      { status: 200 }
    );
    console.log("set-cookie:"+response.headers.get("set-cookie"));
    // Token'ı cookie olarak ayarla
    response.cookies.set("token", token, cookieOptions);
    
    return response;
  } catch (error) {
    console.error("Login hatası:", error);
    return NextResponse.json(
      { error: "Giriş yapılırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 