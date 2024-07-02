class SensorDataChannel < ApplicationCable::Channel
  def subscribed
    ch = "sensor:#{params[:sensor_id]}:sensor_data"
    stream_from ch
    p "#{ch} subscribed"
  end

  def unsubscribed
    p "sensor_data unsubscribed"
    # Any cleanup needed when channel is unsubscribed
  end
end
