import { githubLoginUrl } from "../../api";

// En länk till vår server med nycklarna
function GitHubLoginButton() {
  return (
    <a className="button button-primary" href={githubLoginUrl()}>
      Logga in med GitHub
    </a>
  );
}

export default GitHubLoginButton;
