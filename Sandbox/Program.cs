// See https://aka.ms/new-console-template for more information
using System.Text.Json;
using System.Text.Json.Serialization;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var json = await File.ReadAllTextAsync("C:\\Users\\verme\\Downloads\\psalter.json");
        var oldSchema = JsonSerializer.Deserialize<List<OldSchema>>(json);
        var newSchema = oldSchema.Select(x => new NewSchema
        {
            number = x.number.ToString(),
            title = x.heading,
            psalm = x.psalm?.ToString(),
            verses = x.lyrics.Split("\n\n").Select(x => RemoveVerseNumber(x).Trim()).ToList(),
            secondTune = x.Title.Contains("2nd"),
            numVersesInsideStaff = x.NumVersesInsideStaff
        }).ToList();

        File.WriteAllText("C:\\Users\\verme\\Downloads\\psalter_updated.json", JsonSerializer.Serialize(newSchema));
    }

    public static string RemoveVerseNumber(string verse)
    {
        var i = verse.IndexOf(". ");
        return verse.Substring(i + 2);
    }
}

public class OldSchema
{
    public int NumVersesInsideStaff { get; set; }
    public string Title {get; set;}
    public int _id {get; set;}
    public string audioFileName {get; set;}
    public string heading {get; set;}
    public int isFavorite {get; set;}
    public string lyrics {get; set;}
    public int number {get; set;}
    public int numverses {get; set;}
    public int? psalm {get; set;}
    public string scoreFileName { get; set;}
}

public class NewSchema
{
    public required string number { get; set; }
    public required string title { get; set; }
    public string? psalm { get; set; }
    public required List<string> verses { get; set; }
    public required bool secondTune { get; set; }
    public int? numVersesInsideStaff { get; set; }
}