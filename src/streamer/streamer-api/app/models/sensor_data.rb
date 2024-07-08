class SensorData < ApplicationRecord
  self.table_name = 'sensor_data'

  belongs_to :sensor
  belongs_to :sensor_type
  belongs_to :region
  belongs_to :data_type

  before_create :init_attrs
  after_create :publish_ws

  validates :sensor_name, presence: true

  IS_FETCH_FROM_CACHE = false

  def init_attrs
    self.sensor_id ||= Sensor.find_or_create_by(name: sensor_name).id if sensor_name.present?
    self.sensor_type_id ||= SensorType.find_or_create_by(name: sensor_type_name).id if sensor_type_name.present?
    self.region_id ||= Region.find_or_create_by(name: region_name).id if region_name.present?
    self.data_type_id ||= DataType.find_or_create_by(name: data_type_name).id if data_type_name.present?

    self.dt ||= Time.current
    self.dt_year ||= dt.strftime('%Y')
    self.dt_yearmon ||= dt.strftime('%Y-%m')
    self.dt_epoch ||= dt.to_i
    self.partition_yearmon ||= dt.strftime('%Y-%m')
  end

  def as_json(options = {})
    hsh = super().merge!({

    })
    hsh
  end

  def self.search(params = {})
    data = all

    data = data.select %(
      sensor_data.*
    )

    data = data.where('sensor_data.dt >= ?', params[:start_dt]) if params[:start_dt].present?
    data = data.where('sensor_data.dt <= ?', params[:end_dt]) if params[:end_dt].present?

    params[:inner_joins] = []
    params[:left_joins] = [:sensors, :sensor_types, :regions, :data_types]
    params[:keywords_columns] = ['sensor_name', 'sensor_type_name', 'region_name', 'data_type_name']
    params[:order] ||= 'sensor_data.dt DESC'
    params[:use_as_json] = false

    super(params.merge!(data: data))
  end

  def publish_ws
    begin
      main_ch = "sensor_data"
      ch = "sensor:#{sensor_id}:sensor_data"

      ActionCable.server.broadcast main_ch, as_json
      p "Published to '#{main_ch}'"
      
      ActionCable.server.broadcast ch, as_json
      p "Published to '#{ch}'"
    rescue Exception => exc
      p exc.message
      p "Failed to publish_ws"
    end
  end

end
