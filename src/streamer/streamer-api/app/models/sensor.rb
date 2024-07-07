class Sensor < ApplicationRecord
  belongs_to :sensor_type
  belongs_to :region

  IS_FETCH_FROM_CACHE = false

  def as_json(options = {})
    hsh = super().merge!({
      sensor_type: sensor_type.as_json,
      region: region.as_json
    })
    hsh
  end

  def self.search(params = {})
    data = all

    data = data.select %(
      sensors.*,
      sensor_types.name as sensor_type_name,
      regions.name as region_name
    )

    params[:inner_joins] = []
    params[:left_joins] = [:sensor_types, :regions]
    params[:keywords_columns] = ['sensors.name', 'sensor_types.name', 'regions.name']
    params[:order] = params[:order] || 'sensors.name ASC'
    params[:use_as_json] = false

    super(params.merge!(data: data))
  end

end
