defmodule LiveChatWeb.SessionController do
  use LiveChatWeb, :controller
  alias LiveChat.Sessions

  def index(conn, _params) do
    sessions = Sessions.list_sessions()

    render(conn, "index.html", sessions: sessions)
  end

  def show(conn, %{"id" => id}) do
    session = Sessions.get_session!(id)

    render(conn, "show.html", session: session)
  end
end
