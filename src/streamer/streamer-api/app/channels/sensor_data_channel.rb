class SensorDataChannel < ApplicationCable::Channel
  def subscribed
    ch = "sensor_data"
    ch = "sensor:#{params[:sensor_id]}:sensor_data" if params[:sensor_id].present?
    stream_from ch

    p "#{ch} subscribed"
  end

  def unsubscribed
    ch = "sensor_data"
    ch = "sensor:#{params[:sensor_id]}:sensor_data" if params[:sensor_id].present?

    p "#{ch} unsubscribed"
    # Any cleanup needed when channel is unsubscribed
  end
end
