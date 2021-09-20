defmodule LiveChat.Sessions.Session do
  use Ecto.Schema
  import Ecto.Changeset

  schema "sessions" do
    field :name, :string
    field :tenant, :string

    timestamps()
  end

  @doc false
  def changeset(session, attrs) do
    session
    |> cast(attrs, [:name, :tenant])
    |> validate_required([:name, :tenant])
  end
end
