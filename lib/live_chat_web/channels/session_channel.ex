defmodule LiveChatWeb.SessionChannel do
  use Phoenix.Channel
  alias LiveChat.Sessions
  alias LiveChatWeb.Presence

  def join("session:" <> session_id, %{"name" => name}, socket) do
    try do
      Sessions.get_session!(session_id)
      send(self(), :after_join)
      {:ok, assign(socket, :name, name)}
    rescue
      Ecto.NoResultsError ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("message", %{"body" => body}, socket) do
    broadcast!(socket, "message", %{body: body, name: socket.assigns.name})

    {:noreply, socket}
  end
end
