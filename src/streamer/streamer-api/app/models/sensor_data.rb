class SensorData < ApplicationRecord
  self.table_name = 'sensor_data'

  belongs_to :sensor
  belongs_to :sensor_type
  belongs_to :region
  belongs_to :data_type
end
