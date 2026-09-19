require 'xcodeproj'

project = Xcodeproj::Project.open('ios/App/App.xcodeproj')
app = project.targets.find { |target| target.name == 'App' }
raise 'App target is missing' unless app
app.build_configurations.each do |config|
  next unless config.name == 'Release'
  config.build_settings['DEVELOPMENT_TEAM'] = ENV.fetch('APPLE_TEAM_ID')
  config.build_settings['CODE_SIGN_STYLE'] = 'Manual'
  config.build_settings['CODE_SIGN_IDENTITY'] = 'Apple Distribution'
  config.build_settings['PROVISIONING_PROFILE_SPECIFIER'] = ENV.fetch('PROFILE_UUID')
  config.build_settings['CURRENT_PROJECT_VERSION'] = ENV.fetch('GITHUB_RUN_NUMBER') + '.' + ENV.fetch('GITHUB_RUN_ATTEMPT')
end
project.save
