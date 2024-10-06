import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

let pems: any = {};

const getPems = async () => {
    const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    const { data } = await axios.get(jwksUrl);
    const keys = data['keys'];
    pems = {};
    keys.forEach((key: any) => {
        const pem = jwkToPem(key);
        pems[key.kid] = pem;
    });
};

getPems();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decodedJwt: any = jwt.decode(token, { complete: true });
    if (!decodedJwt) return res.status(401).json({ message: 'Unauthorized' });

    const pem = pems[decodedJwt.header.kid];
    if (!pem) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err: any, payload: any) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.user = payload;
        next();
    });
};

