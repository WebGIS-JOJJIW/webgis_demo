class MainChannel < ApplicationCable::Channel
  def subscribed
    ch = "main"
    stream_from ch
    p "#{ch} subscribed"
  end

  def unsubscribed
    p "main unsubscribed"
    # Any cleanup needed when channel is unsubscribed
  end
end
