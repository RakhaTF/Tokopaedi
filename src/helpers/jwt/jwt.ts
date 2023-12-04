import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export async function signJWT<T>(payload: string | object | Buffer, secretOrPrivateKey: Secret, options?: SignOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        jwt.sign(payload, secretOrPrivateKey, options || {}, (err, token) => {
            if (err) {
            reject(err);
            return;
                }
            resolve(token as T);
        });
    });
}

