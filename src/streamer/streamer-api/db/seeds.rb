# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

["sensor1","sensor2","sensor3","sensor4","sensor5"].each do |sensor_name|
  Sensor.find_or_create_by!(name: sensor_name)
end

["sensor_type1","sensor_type2","sensor_type3","sensor_type4","sensor_type5"].each do |sensor_type_name|
  SensorType.find_or_create_by!(name: sensor_type_name)
end

["region1","region2","region3","region4","region5"].each do |region_name|
  Region.find_or_create_by!(name: region_name)
end

["data_type1","data_type2","data_type3","data_type4","data_type5"].each do |data_type_name|
  DataType.find_or_create_by!(name: data_type_name)
end