
import { SvgXml } from 'react-native-svg';
import { divelogs_logo, filtericon } from '../../assets/svgs.js'
import styles from '../../stylesheets/styles'

const AppHeader = () => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />

export default AppHeader