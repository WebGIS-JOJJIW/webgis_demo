require "test_helper"

class SensorTypesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @sensor_type = sensor_types(:one)
  end

  test "should get index" do
    get sensor_types_url, as: :json
    assert_response :success
  end

  test "should create sensor_type" do
    assert_difference("SensorType.count") do
      post sensor_types_url, params: { sensor_type: { description: @sensor_type.description, name: @sensor_type.name } }, as: :json
    end

    assert_response :created
  end

  test "should show sensor_type" do
    get sensor_type_url(@sensor_type), as: :json
    assert_response :success
  end

  test "should update sensor_type" do
    patch sensor_type_url(@sensor_type), params: { sensor_type: { description: @sensor_type.description, name: @sensor_type.name } }, as: :json
    assert_response :success
  end

  test "should destroy sensor_type" do
    assert_difference("SensorType.count", -1) do
      delete sensor_type_url(@sensor_type), as: :json
    end

    assert_response :no_content
  end
end
