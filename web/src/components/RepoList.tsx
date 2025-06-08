type Repo = {
  name: string;
  html_url: string;
  description?: string;
};

type Props = {
  repos: Repo[];
};

const RepoList = ({ repos }: Props) => (
  <ul style={{ listStyle: 'none', padding: 0 }}>
    {repos.map((repo) => (
      <li key={repo.html_url} style={{ marginBottom: '1rem' }}>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#3b82f6' }}
        >
          {repo.name}
        </a>
        {repo.description && (
          <p style={{ margin: 0, color: 'grey', }}>{repo.description}</p>
        )}
      </li>
    ))}
  </ul>
);

export default RepoList;
