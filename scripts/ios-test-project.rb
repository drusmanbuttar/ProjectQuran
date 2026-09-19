require 'xcodeproj'
project = Xcodeproj::Project.open('ios/App/App.xcodeproj')
app = project.targets.find { |t| t.name == 'App' }
test = project.targets.find { |t| t.name == 'PocketQuranTests' }
unless test
  test = project.new_target(:unit_test_bundle, 'PocketQuranTests', :ios, '15.0')
  test.add_dependency(app)
  group = project.main_group.new_group('PocketQuranTests', 'PocketQuranTests')
  source = group.new_file('PocketQuranTests.swift')
  test.source_build_phase.add_file_reference(source)
  product = app.package_product_dependencies.first
  test.package_product_dependencies << product
  framework = project.new(Xcodeproj::Project::Object::PBXBuildFile)
  framework.product_ref = product
  test.frameworks_build_phase.files << framework
  test.build_configurations.each do |config|
    config.build_settings['SWIFT_VERSION'] = '5.0'
    config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
    config.build_settings['PRODUCT_NAME'] = '$(TARGET_NAME)'
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.drusmanbuttar.projectquran.tests'
    config.build_settings['TEST_HOST'] = '$(BUILT_PRODUCTS_DIR)/App.app/App'
    config.build_settings['BUNDLE_LOADER'] = '$(TEST_HOST)'
    config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
  end
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_test_target(test)
scheme.set_launch_target(app)
scheme.save_as('ios/App/App.xcodeproj', 'App', true)

