/**
 * Container for profile settings
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import  _ from 'lodash'

import ProfileSettingsForm from '../components/ProfileSettingsForm'
import NotificationSettingsForm from '../../notifications/components/NotificationSettingsForm'
import SystemSettingsForm from '../../system/components/SystemSettingsForm'

import SettingsPanel from '../../../components/SettingsPanel'
import spinnerWhileLoading from '../../../../../components/LoadingSpinner'
import { requiresAuthentication } from '../../../../../components/AuthenticatedComponent'
import { getProfileSettings, saveProfileSettings, uploadProfilePhoto, getNotificationSettings, saveNotificationSettings,
  checkEmailAvailability, changeEmail, changePassword, getSystemSettings, resetPassword } from '../../../actions/index'
import { formatProfileSettings } from '../../../helpers/settings'
import { 
  ROLE_CONNECT_COPILOT, 
  ROLE_CONNECT_MANAGER, 
  ROLE_CONNECT_ACCOUNT_MANAGER, 
  ROLE_CONNECT_COPILOT_MANAGER, 
  ROLE_ADMINISTRATOR, 
  ROLE_CONNECT_ADMIN 
} from '../../../../../config/constants'

const enhance = spinnerWhileLoading(props => !props.values.isLoading)
const ProfileSettingsFormEnhanced = enhance(ProfileSettingsForm)
const NotificationSettingsFormWithLoader = enhance(NotificationSettingsForm)
const SystemSettingsFormEnhanced = spinnerWhileLoading(props => !props.systemSettings.isLoading)(SystemSettingsForm)

class ProfileSettingsContainer extends Component {
  componentDidMount() {
    this.props.getProfileSettings()
    this.props.getNotificationSettings()
    this.props.getSystemSettings()
  }

  render() {
    const { profileSettings, saveProfileSettings, uploadProfilePhoto, user, notificationSettings, saveNotificationSettings, isCustomer } = this.props

    return (
      <SettingsPanel
        title="My profile"
        user={user}
      >
        <ProfileSettingsFormEnhanced
          values={profileSettings}
          saveSettings={saveProfileSettings}
          uploadPhoto={uploadProfilePhoto}
        />
        <NotificationSettingsFormWithLoader
          values={notificationSettings}
          onSubmit={saveNotificationSettings}
          isCustomer={isCustomer}
        />
        <SystemSettingsFormEnhanced
          {...this.props}
        />
      </SettingsPanel>
    )
  }
}

ProfileSettingsContainer.propTypes = {
  profileSettings: PropTypes.object.isRequired,
  getProfileSettings: PropTypes.func.isRequired,
  notificationSettings: PropTypes.object.isRequired,
  getNotificationSettings: PropTypes.func.isRequired,
  saveNotificationSettings: PropTypes.func.isRequired
}

const ProfileSettingsContainerWithAuth = requiresAuthentication(ProfileSettingsContainer)

const mapStateToProps = ({ settings, loadUser  }) => { 
  const powerUserRoles = [ROLE_CONNECT_COPILOT, ROLE_CONNECT_MANAGER, ROLE_CONNECT_ACCOUNT_MANAGER, ROLE_CONNECT_COPILOT_MANAGER, ROLE_ADMINISTRATOR, ROLE_CONNECT_ADMIN]

  return ({
    profileSettings: {
      ...settings.profile,
      settings: formatProfileSettings(settings.profile.traits)
    },
    systemSettings: settings.system,
    user: loadUser.user,
    isCustomer: _.intersection(loadUser.user.roles, powerUserRoles).length === 0,
    notificationSettings: settings.notifications
  })
}

const mapDispatchToProps = {
  getProfileSettings,
  saveProfileSettings,
  uploadProfilePhoto,
  getNotificationSettings,
  saveNotificationSettings,
  getSystemSettings,
  checkEmailAvailability,
  changeEmail,
  changePassword,
  resetPassword,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSettingsContainerWithAuth)
