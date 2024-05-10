import { CONFIG } from "@resource/constants";

export const generateTwitchOAtuhURL = ({
  clientId,
  redirectUri,
  responseType,
  scope,
}: {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string; // https://dev.twitch.tv/docs/authentication/scopes/
}) => {
  return `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
};
const authorizeUrl = generateTwitchOAtuhURL({
  clientId: CONFIG.API_KEY,
  redirectUri: CONFIG.OAUTH.REDIRECT_URI,
  responseType: CONFIG.OAUTH.TYPE,
  scope: CONFIG.OAUTH.SCOPE,
});
export const LoginPage = () => {
  // loading
  return (
    <div>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1>Twitch Broadcast Analizer</h1>
            <p className="py-6">配信におけるかゆいところに手が届くサービス</p>
            <a href={authorizeUrl}>
              <button className="btn btn-primary">Twitchアカウントでログイン</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
