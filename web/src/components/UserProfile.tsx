type Props = {
  name: string;
  login: string;
  avatarUrl: string;
};

const UserProfile = ({ name, login, avatarUrl }: Props) => (
  <div>
    <p>Bienvenido, {name || login}</p>
    <img src={avatarUrl} alt="Avatar" width={80} style={{ borderRadius: '50%' }} />
  </div>
);

export default UserProfile;
