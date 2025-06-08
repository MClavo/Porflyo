type Props = {
  name: string;
  login: string;
  avatar_url: string;
};

const UserProfile = ({ name, login, avatar_url }: Props) => (
  <div>
    <p>Bienvenido, {name || login}</p>
    <img src={avatar_url} alt="Avatar" width={80} style={{ borderRadius: '50%' }} />
  </div>
);

export default UserProfile;
