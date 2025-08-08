type Props = {
  name: string;
  login: string;
  profileImage: string;
};

const UserProfile = ({ name, login, profileImage }: Props) => (
  <div>
    <p>Bienvenido, {name || login}</p>
    <img src={profileImage} alt="Avatar" width={80} style={{ borderRadius: '50%' }} />
  </div>
);

export default UserProfile;
