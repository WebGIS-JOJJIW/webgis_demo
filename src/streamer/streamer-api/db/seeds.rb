# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

[
  {name: "sensor1", poi_id: "sensor1"},
  {name: "sensor2", poi_id: "sensor2"},
  {name: "sensor3", poi_id: "sensor3"}
].each do |hsh|
  sensor = Sensor.find_or_initialize_by(poi_id: hsh[:poi_id])
  sensor.name = hsh[:name]
  sensor.save
end

["sensor_type1","sensor_type2","sensor_type3","sensor_type4","sensor_type5"].each do |sensor_type_name|
  SensorType.find_or_create_by!(name: sensor_type_name)
end

["region1","region2","region3","region4","region5"].each do |region_name|
  Region.find_or_create_by!(name: region_name)
end

["data_type1","data_type2"].each do |data_type_name|
  DataType.find_or_create_by!(name: data_type_name)
end

DataType.find(1).update(name:"summary")
DataType.find(2).update(name:"image")