import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken"

export async function signJWT<T>(payload: string | object | Buffer, secretOrPrivateKey: Secret, options?: SignOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        jwt.sign(payload, secretOrPrivateKey, options || {}, (err, token) => {
            if (err) {
                reject(err)
                return
            }
            resolve(token as T)
        })
    })
}

export function verifyJWT<T>(token: string, secret: string, options?: VerifyOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        jwt.verify(token, secret, options, (error, decoded) => {
            if (error) {
                reject(error)
            } else {
                resolve(decoded as T)
            }
        })
    })
}
