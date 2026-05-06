import * as jose from 'jose';

export interface PlnnrrTokenPayload {
  kind: 'app_integration';
  userId: string;
  tenantId: string;
  appId: string;
  installationId: string;
}

/**
 * Verify a Plnnrr integration JWT using the JWKS endpoint
 * @param token The JWT string to verify
 * @param plnnrrJwksUrl The full URL to Plnnrr's /.well-known/jwks.json
 */
export async function verifyPlnnrrToken(token: string, plnnrrJwksUrl: string): Promise<PlnnrrTokenPayload> {
  const jwks = jose.createRemoteJWKSet(new URL(plnnrrJwksUrl));
  const { payload } = await jose.jwtVerify(token, jwks, {
    algorithms: ['RS256'],
  });

  if (payload.kind !== 'app_integration') {
    throw new Error('Invalid token kind. Expected app_integration.');
  }

  return payload as unknown as PlnnrrTokenPayload;
}
