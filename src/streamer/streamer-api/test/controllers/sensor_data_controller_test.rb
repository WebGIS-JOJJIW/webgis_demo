require "test_helper"

class SensorDataControllerTest < ActionDispatch::IntegrationTest
  setup do
    @sensor_datum = sensor_data(:one)
  end

  test "should get index" do
    get sensor_data_url, as: :json
    assert_response :success
  end

  test "should create sensor_datum" do
    assert_difference("SensorDatum.count") do
      post sensor_data_url, params: { sensor_datum: { data_type_id: @sensor_datum.data_type_id, data_type_name: @sensor_datum.data_type_name, dt: @sensor_datum.dt, dt_epoch: @sensor_datum.dt_epoch, dt_year: @sensor_datum.dt_year, dt_yearmon: @sensor_datum.dt_yearmon, lat: @sensor_datum.lat, lon: @sensor_datum.lon, partition_yearmon: @sensor_datum.partition_yearmon, region_id: @sensor_datum.region_id, region_name: @sensor_datum.region_name, sensor_id: @sensor_datum.sensor_id, sensor_name: @sensor_datum.sensor_name, sensor_type_id: @sensor_datum.sensor_type_id, sensor_type_name: @sensor_datum.sensor_type_name, value: @sensor_datum.value } }, as: :json
    end

    assert_response :created
  end

  test "should show sensor_datum" do
    get sensor_datum_url(@sensor_datum), as: :json
    assert_response :success
  end

  test "should update sensor_datum" do
    patch sensor_datum_url(@sensor_datum), params: { sensor_datum: { data_type_id: @sensor_datum.data_type_id, data_type_name: @sensor_datum.data_type_name, dt: @sensor_datum.dt, dt_epoch: @sensor_datum.dt_epoch, dt_year: @sensor_datum.dt_year, dt_yearmon: @sensor_datum.dt_yearmon, lat: @sensor_datum.lat, lon: @sensor_datum.lon, partition_yearmon: @sensor_datum.partition_yearmon, region_id: @sensor_datum.region_id, region_name: @sensor_datum.region_name, sensor_id: @sensor_datum.sensor_id, sensor_name: @sensor_datum.sensor_name, sensor_type_id: @sensor_datum.sensor_type_id, sensor_type_name: @sensor_datum.sensor_type_name, value: @sensor_datum.value } }, as: :json
    assert_response :success
  end

  test "should destroy sensor_datum" do
    assert_difference("SensorDatum.count", -1) do
      delete sensor_datum_url(@sensor_datum), as: :json
    end

    assert_response :no_content
  end
end
