import styles from './render.module.css';

type Props = {
  placeholder?: string;
  className?: string;
};

export function EmptyItem({ placeholder = 'Vacío', className = '' }: Props) {
  return (
    <div className={`${styles.empty} ${className}`}>
      <span className={styles.placeholder}>{placeholder}</span>
    </div>
  );
}

export default EmptyItem;
