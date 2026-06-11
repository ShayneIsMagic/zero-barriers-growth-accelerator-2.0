import click

from create_app import create_app
from config.config import Config

app = create_app()


@app.cli.command('demo-data')
def demo_data_command():
    """Seed framework catalog, scoring bands, and sample synonyms."""
    from src.lib.demo_data.seed_catalog import seed_all

    with app.app_context():
        seed_all()
    click.echo('Demo data seeded successfully.')


@app.cli.command('seed-catalog')
def seed_catalog_command():
    """Seed framework element catalog and patterns from bundled data."""
    from src.lib.demo_data.seed_catalog import seed_all

    with app.app_context():
        seed_all()
    click.echo('Catalog seeded successfully.')


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'demo-data':
            with app.app_context():
                from src.lib.demo_data.seed_catalog import seed_all

                seed_all()
            click.echo('Demo data seeded successfully.')
            sys.exit(0)
        if command == 'seed-catalog':
            with app.app_context():
                from src.lib.demo_data.seed_catalog import seed_all

                seed_all()
            click.echo('Catalog seeded successfully.')
            sys.exit(0)
        click.echo(f'Unknown command: {command}')
        sys.exit(1)

    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
    )
