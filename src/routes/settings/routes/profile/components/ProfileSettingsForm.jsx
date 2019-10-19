/**
 * Profile settings form
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FormsyForm from 'appirio-tech-react-components/components/Formsy'
import PhoneInput from 'appirio-tech-react-components/components/Formsy/PhoneInput'
import TimezoneInput from 'appirio-tech-react-components/components/Formsy/TimezoneInput'
const TCFormFields = FormsyForm.Fields
const Formsy = FormsyForm.Formsy
import ProfileSettingsAvatar from './ProfileSettingsAvatar'
import FormsySelect from '../../../../../components/Select/FormsySelect'
import ISOCountries from '../../../../../helpers/ISOCountries'

import './ProfileSettingsForm.scss'

const countries = _.orderBy(ISOCountries, ['name'], ['asc']).map(country => ({
  label: country.name,
  value: country.name,
}))

class ProfileSettingsForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      valid: false,
      dirty: false,
      businessPhoneValid: true,
      countrySelected: null,
      countryCodeSelected: null,
      businessPhoneDirty: false,
      countrySelectionDirty: false
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.onValid = this.onValid.bind(this)
    this.onInvalid = this.onInvalid.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onBusinessPhoneCountryChange = this.onBusinessPhoneCountryChange.bind(this)
    this.onCountryChange = this.onCountryChange.bind(this)

    this.hideCountrySelectAlert = this.hideCountrySelectAlert.bind(this)
    this.hideBusinessPhoneAlert = this.hideBusinessPhoneAlert.bind(this)
  }

  onCountryChange(country) {
    // on country change, country code of business phone should change automatically
    if (country && country.value && this.state.countrySelected !== country.value) {
      this.setState({
        countrySelected: country.value,
        countryCodeSelected: _.get(_.find(ISOCountries, c => c.name === country.value), 'alpha2'),
        countrySelectionDirty: true
      })
    }
  }

  onBusinessPhoneCountryChange({ country, externalChange }) {
    const { businessPhoneValid, countrySelected: previousSelectedCountry } = this.state

    if (country && country.code) {
      if (previousSelectedCountry !== country.name && country.name) {
        // when country code of business phone changes, the country selection should change automatically
        this.refs.countrySelect.setValue(country.name)
        this.setState({
          countrySelected: country.name,
          countryCodeSelected: country.alpha2,
        })
      }

      if (!businessPhoneValid) {
        this.setState({
          businessPhoneValid: true
        })
      }
    } else if (businessPhoneValid) {
      this.setState({
        businessPhoneValid: false
      })
    }

    // external change means, the user didn't change the phone number field.
    // But it was automatically changed due to country selection change. In such case, we should show
    // the alert under country selection only.
    const countryName = country && country.name
    const countryCodeChanged = countryName && previousSelectedCountry && countryName !== previousSelectedCountry
    if (!externalChange && countryCodeChanged) {
      this.setState({
        businessPhoneDirty: true
      })
    }
  }

  hideCountrySelectAlert() {
    this.setState({
      countrySelectionDirty: false
    })
  }

  hideBusinessPhoneAlert () {
    this.setState({
      businessPhoneDirty: false
    })
  }

  getField(label, name, isRequired=false, isDisabled=false) {
    let validations = null
    if (name === 'businessPhone') {
      validations = {
        // use same regexp as on server side
        matchRegexp: /^\+(?:[0-9] ?){6,14}[0-9]$/
      }
    }

    return (
      <div className="field">
        <div className="label">
          <span styleName="fieldLabelText">{label}</span>&nbsp;
          {isRequired && <sup styleName="requiredMarker">*</sup> }
        </div>
        <TCFormFields.TextInput
          wrapperClass="input-field"
          type="text"
          name={name}
          validations={validations}
          value={this.props.values.settings[name] || ''}
          validationError={`Please enter ${label}`}
          required={isRequired}
          disabled={isDisabled}
        />
      </div>
    )
  }

  onSubmit(data) {
    // hardcoding company size for now as it's required in the backend
    const defaultValues = {
      companySize: '16-50'
    }
    // we have to use initial data as a base for updated data
    // as form could update not all fields, thus they won't be included in `data`
    // for example user avatar is not included in `data` thus will be removed if don't use
    // this.props.values.settings as a base
    const updatedData = {
      ...defaultValues,
      ...this.props.values.settings,
      ...data,
    }
    this.props.saveSettings(updatedData)

    this.setState({
      businessPhoneDirty: false,
      countrySelectionDirty: false
    })
  }

  onValid() {
    this.setState({valid: true})
  }

  onInvalid() {
    this.setState({valid: false})
  }

  onChange(currentValues, isChanged) {
    if (this.state.dirty !== isChanged) {
      this.setState({ dirty: isChanged })
    }
  }

  render() {
    const { isCopilot, isCustomer, isManager } = this.props
    return (
      <Formsy.Form
        className="profile-settings-form"
        onInvalid={this.onInvalid}
        onValid={this.onValid}
        onValidSubmit={this.onSubmit}
        onChange={this.onChange}
      >
        <div className="section-heading">Personal information</div>
        <div className="field">
          <div className="label">Avatar</div>
          <ProfileSettingsAvatar
            isUploading={this.props.values.isUploadingPhoto}
            photoUrl={this.props.values.settings.photoUrl}
            uploadPhoto={this.props.uploadPhoto}
          />
        </div>
        {this.getField('First Name', 'firstName', true)}
        {this.getField('Last Name', 'lastName', true)}
        {this.getField('Title', 'title', true)}
        <div className="field">
          <div className="label">
            <span styleName="fieldLabelText">Business Phone</span>&nbsp;
            <sup styleName="requiredMarker">*</sup>
          </div>
          <div className="input-field">
            <PhoneInput
              validations={{
                isValid: () => this.state.businessPhoneValid
              }}
              ref="phoneInput"
              wrapperClass={'input-container'}
              name="businessPhone"
              type="phone"
              validationError="Invalid business phone"
              showCheckMark
              required
              listCountry={ISOCountries}
              forceCountry={this.state.countrySelected}
              value={this.props.values.settings.businessPhone}
              onChangeCountry={this.onBusinessPhoneCountryChange}
              onOutsideClick={this.hideBusinessPhoneAlert}
              disabled={isCopilot && !isManager}
            />
            {
              this.state.businessPhoneDirty &&
              <div styleName="warningText">Note: Changing the country code also updates your country selection</div>
            }
          </div>
        </div>
        {this.getField('Company name', 'companyName', true, (isCustomer || isCopilot) && !isManager)}
        <div className="field">
          <div className="label">
            <span styleName="fieldLabelText">Country</span>
          </div>
          <div className="input-field">
            <FormsySelect
              ref="countrySelect"
              name="country"
              value={this.props.values.settings.country ? this.props.values.settings.country : ''}
              options={countries}
              onChange={this.onCountryChange}
              placeholder="- Select country -"
              showDropdownIndicator
              setValueOnly
              onBlur={this.hideCountrySelectAlert}
            />
            {
              this.state.countrySelectionDirty &&
              <div styleName="warningText">Note: Changing the country also updates the country code of business phone.</div>
            }
          </div>
        </div>
        <div className="field">
          <div className="label">
            <span styleName="fieldLabelText">Local Timezone</span>&nbsp;
            <sup styleName="requiredMarker">*</sup>
          </div>
          <div className="input-field">
            <TimezoneInput
              filterCountry={this.state.countryCodeSelected}
              render={
                timezoneOptions => (
                  <FormsySelect
                    name="timezone" options={timezoneOptions}
                  />
                )
              }
            />
          </div>
        </div>
        <div className="controls">
          <button
            type="submit"
            className="tc-btn tc-btn-primary"
            disabled={this.props.values.pending || !this.state.valid || !this.state.dirty}
          >
            Save settings
          </button>
        </div>
      </Formsy.Form>
    )
  }
}

ProfileSettingsForm.propTypes = {
  values: PropTypes.object.isRequired,
  saveSettings: PropTypes.func.isRequired,
  uploadPhoto: PropTypes.func.isRequired,
  isCustomer: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired,
  isCopilot: PropTypes.bool.isRequired
}

export default ProfileSettingsForm
