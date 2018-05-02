package pb138;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

/**
 * Handles requests starting with "record/".
 */
public class RecordHandler extends AbstractHandler {
    private LibraryEditor editor;
    
    public RecordHandler(LibraryEditor editor) {
        this.editor = editor;
    }
    
    @Override
    public void handle(String target,
            Request base,
            HttpServletRequest req,
            HttpServletResponse res
    ) throws IOException, ServletException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

}
