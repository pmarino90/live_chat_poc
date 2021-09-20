defmodule LiveChat.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      LiveChat.Repo,
      # Start the Telemetry supervisor
      LiveChatWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: LiveChat.PubSub},
      # Start the Endpoint (http/https)
      LiveChatWeb.Endpoint,
      # Start a worker by calling: LiveChat.Worker.start_link(arg)
      # {LiveChat.Worker, arg}
      LiveChatWeb.Presence
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: LiveChat.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    LiveChatWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
