defmodule LiveChat.Repo.Migrations.CreateSessions do
  use Ecto.Migration

  def change do
    create table(:sessions) do
      add :name, :string
      add :tenant, :string

      timestamps()
    end
  end
end
